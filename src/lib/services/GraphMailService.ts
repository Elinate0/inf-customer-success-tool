/**
 * Microsoft Graph API Service (Skeleton)
 * 
 * Bu servis, MS Graph üzerinden kullanıcının Outlook/Exchange
 * gelen kutusuna erişip mailleri okumak ve yanıt taslakları göndermek için kullanılacaktır.
 */

export interface GraphEmail {
  id: string
  subject: string
  sender: { emailAddress: { name: string; address: string } }
  bodyPreview: string
  body: { content: string; contentType: string }
  receivedDateTime: string
  isRead: boolean
}

export class GraphMailService {
  private accessToken: string | null = null

  constructor() {
    // In a real implementation, you would obtain the token via MSAL (Microsoft Authentication Library)
    // or through an OAuth2 flow managed by your backend/Next.js API route.
  }

  setToken(token: string) {
    this.accessToken = token
  }

  private async fetchGraph(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error("Graph API accessToken is missing.")
    }

    const response = await fetch(`https://graph.microsoft.com/v1.0${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Graph API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Son mailleri getirir.
   */
  async getRecentEmails(limit: number = 20): Promise<GraphEmail[]> {
    // Skeleton: Gerçek entegrasyonda aktif edilecek.
    // return this.fetchGraph(`/me/messages?$top=${limit}&$select=subject,sender,bodyPreview,body,receivedDateTime,isRead&$orderby=receivedDateTime DESC`)
    
    // MOCK DATA:
    return [
      {
        id: 'msg_1',
        subject: 'Acil: Sunucu Hatası Hakkında',
        sender: { emailAddress: { name: 'Ahmet Yılmaz', address: 'ahmet@acme.com' } },
        bodyPreview: 'Merhaba, bugün fatura kesme sayfasında sürekli bir sunucu hatası alıyoruz...',
        body: { content: 'Merhaba, bugün fatura kesme sayfasında sürekli bir sunucu hatası alıyoruz. Acil destek rica ederim.', contentType: 'text' },
        receivedDateTime: new Date().toISOString(),
        isRead: false,
      },
      {
        id: 'msg_2',
        subject: 'Q3 Değerlendirme Toplantısı Notları',
        sender: { emailAddress: { name: 'Ayşe Demir', address: 'ayse@xyz.com' } },
        bodyPreview: 'Dünkü toplantıya katılımınız için teşekkürler. Notları ekte iletiyorum...',
        body: { content: 'Dünkü toplantıya katılımınız için teşekkürler. Lütfen yeni kullanıcı eğitimleri için takvimi planlayalım.', contentType: 'text' },
        receivedDateTime: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
      }
    ]
  }

  /**
   * Taslak mail oluşturur.
   */
  async createDraft(to: string, subject: string, content: string) {
    // return this.fetchGraph('/me/messages', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     subject,
    //     body: { contentType: 'HTML', content },
    //     toRecipients: [{ emailAddress: { address: to } }]
    //   })
    // })
    console.log(`Draft created for ${to}: ${subject}`)
    return true
  }
}

export const graphMailService = new GraphMailService()
