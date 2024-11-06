import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Upload } from 'lucide-react';
import { KeywordTable } from './keyword/KeywordTable';
import { FunnelAnalysis } from './FunnelAnalysis';
import { KeywordStats } from './KeywordStats';
import { toast } from './ui/Toast';
import { webhookService, WebhookError } from '../services/webhookService';
import { projectService } from '../services/projectService';
import { parseCSV } from '../utils/csvParser';

interface WebhookResponse {
  status: number;
  body: {
    ID: string;
    "Auto Suggest": string;
  };
}

interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  autoSuggestions?: string[];
  potentialTraffic?: number;
  potentialConversions?: number;
  potentialRevenue?: number;
  isAnalyzing?: boolean;
}

const WEBHOOK_URL = 'https://hook.integrator.boost.space/0w7dejdvm21p78a4lf4wdjkfi8dlvk25';

export function TierKeywords() {
  const { tierId } = useParams<{ tierId: string }>();
  const [keywords, setKeywords] = useState<Keyword[]>([]);

  // Carregar keywords específicas do tier atual
  useEffect(() => {
    const loadTierKeywords = () => {
      const projectId = localStorage.getItem('currentProjectId');
      if (!projectId) return;

      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const currentProject = projects.find((p: any) => p.id === projectId);
      
      if (currentProject) {
        // Usar uma chave específica para cada tier
        const tierKey = `tier${tierId}Keywords`;
        const tierKeywords = currentProject.data?.[tierKey] || [];
        setKeywords(tierKeywords);
      }
    };

    loadTierKeywords();
  }, [tierId]); // Recarregar quando mudar de tier

  // Função para salvar keywords específicas do tier
  const saveTierKeywords = (newKeywords: Keyword[]) => {
    const projectId = localStorage.getItem('currentProjectId');
    if (!projectId) return;

    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = projects.findIndex((p: any) => p.id === projectId);
    
    if (projectIndex !== -1) {
      const tierKey = `tier${tierId}Keywords`;
      
      // Atualizar apenas as keywords do tier atual
      projects[projectIndex].data = {
        ...projects[projectIndex].data,
        [tierKey]: newKeywords
      };
      
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  };

  // Função para processar o upload de CSV
  const handleFileUpload = async (file: File) => {
    try {
      const csvData = await parseCSV(file);
      
      // Converter dados do CSV para o formato de keywords
      const newKeywords: Keyword[] = csvData.map((row, index) => ({
        id: `${tierId}-${index}-${Date.now()}`, // ID único incluindo o tierId
        keyword: row.keyword,
        volume: parseInt(row.volume) || 0,
        difficulty: parseInt(row.difficulty) || 0,
        autoSuggestions: [],
        potentialTraffic: 0,
        potentialConversions: 0,
        potentialRevenue: 0
      }));

      setKeywords(newKeywords);
      saveTierKeywords(newKeywords);
      toast.success('Keywords uploaded successfully');
    } catch (error) {
      console.error('Error uploading keywords:', error);
      toast.error('Failed to upload keywords');
    }
  };

  // Atualizar a função analyzeKeywords para salvar no tier correto
  const analyzeKeywords = async () => {
    if (selectedKeywords.size === 0) {
      toast.error('Please select keywords to analyze');
      return;
    }

    setIsAnalyzing(true);

    try {
      const selectedKeywordsList = keywords.filter(k => 
        selectedKeywords.has(k.keyword)
      );

      const payload = {
        keywords: selectedKeywordsList.map(k => ({
          id: k.id,
          keyword: k.keyword,
          volume: k.volume
        })),
        contextData: {
          tierId
        }
      };

      console.log('Analyzing keywords:', payload);

      const response = await webhookService.sendKeywordData(payload);
      console.log('Webhook response:', response);
      
      if (!response?.body?.["Auto Suggest"]) {
        toast.warning('No suggestions received from analysis');
        return;
      }

      // Converte a string de sugestões em array
      const suggestions = response.body["Auto Suggest"]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Atualiza a keyword que corresponde ao ID retornado
      const updatedKeywords = keywords.map(keyword => {
        if (keyword.id === response.body.ID) {
          return {
            ...keyword,
            autoSuggestions: suggestions,
            isAnalyzed: true,
            isAnalyzing: false
          };
        }
        return keyword;
      });

      console.log('Updated keywords:', updatedKeywords);
      setKeywords(updatedKeywords);
      saveTierKeywords(updatedKeywords);
      
      toast.success('Keywords analyzed successfully');

    } catch (error) {
      console.error('Error analyzing keywords:', error);
      toast.error(error instanceof WebhookError 
        ? `Analysis error: ${error.message}`
        : 'Failed to analyze keywords'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeywordUpdate = (updatedKeyword: Keyword) => {
    const newKeywords = keywords.map(kw => 
      kw.id === updatedKeyword.id ? updatedKeyword : kw
    );
    
    setKeywords(newKeywords);
    saveTierKeywords(newKeywords);
    
    toast.success('Changes saved successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Keywords Analysis</h2>
        <Button onClick={handleSaveAll}>Save All Changes</Button>
      </div>
      
      <div className="keywords-table-container">
        <KeywordTable 
          data={keywords}
          onKeywordUpdate={handleKeywordUpdate}
        />
      </div>
    </div>
  );
}