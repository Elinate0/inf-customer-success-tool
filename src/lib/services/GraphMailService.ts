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
    try {
      const data = await this.fetchGraph(`/me/messages?$top=${limit}&$select=subject,sender,bodyPreview,body,receivedDateTime,isRead&$orderby=receivedDateTime DESC`)
      return data.value || []
    } catch (err) {
      console.error("GraphMailService getRecentEmails error:", err)
      return []
    }
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
