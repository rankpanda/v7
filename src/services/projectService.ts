import { toast } from '../components/ui/Toast';

interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  autoSuggestions: string[];
  potentialTraffic: number;
  potentialConversions: number;
  potentialRevenue: number;
}

interface ProjectData {
  tier1Keywords?: Keyword[];
  tier2Keywords?: Keyword[];
  tier3Keywords?: Keyword[];
  tier4Keywords?: Keyword[];
  tier5Keywords?: Keyword[];
}

interface Project {
  id: string;
  name: string;
  data: ProjectData;
}

export const projectService = {
  async getTierKeywords(projectId: string, tier: number): Promise<any[]> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: Project) => p.id === projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      const tierKey = `tier${tier}Keywords`;
      return project.data[tierKey] || [];
    } catch (error) {
      console.error('Error loading tier keywords:', error);
      throw error;
    }
  },

  async saveTierKeywords(projectId: string, tier: number, keywords: any[]): Promise<void> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }

      const tierKey = `tier${tier}Keywords`;
      projects[projectIndex].data[tierKey] = keywords;
      
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving tier keywords:', error);
      throw error;
    }
  },

  async getProjectContext(projectId: string): Promise<any> {
    try {
      const projects = JSON.parse(localStorage.getItem('projects') || '[]');
      const project = projects.find((p: Project) => p.id === projectId);
      
      if (!project) {
        throw new Error('Project not found');
      }

      return project.context || {};
    } catch (error) {
      console.error('Error loading project context:', error);
      throw error;
    }
  }
};