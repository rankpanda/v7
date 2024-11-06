import { toast } from '../components/ui/Toast';

// Adicionar a classe WebhookError
export class WebhookError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'WebhookError';
  }
}

interface WebhookResponse {
  status: number;
  body: {
    ID: string;
    "Auto Suggest": string;
  };
}

interface WebhookPayload {
  keywords: Array<{
    id: string;
    keyword: string;
    volume: number;
  }>;
  contextData: {
    tierId: string;
    [key: string]: any;
  };
}

// Definir a URL do webhook como constante
const WEBHOOK_URL = 'https://hook.integrator.boost.space/0w7dejdvm21p78a4lf4wdjkfi8dlvk25';

export const webhookService = {
  async sendKeywordData(payload: WebhookPayload): Promise<WebhookResponse> {
    try {
      console.log('Sending webhook payload:', payload);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new WebhookError(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Webhook response data:', data);

      // Retorna a resposta exatamente como veio do servidor
      return data as WebhookResponse;

    } catch (error) {
      console.error('Webhook Error:', error);
      throw new WebhookError(
        'Failed to process webhook response',
        undefined,
        error
      );
    }
  }
};

// Interface para a resposta esperada do webhook
interface WebhookResponseRaw {
  id?: string;
  ID?: string;
  keyword_id?: string;
  suggestions?: string[] | string;
  "Auto Suggest"?: string;
}