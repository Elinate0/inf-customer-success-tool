/**
 * Google Gemini API Service (Skeleton)
 * 
 * Bu servis, sistemin AI asistan (Copilot) katmanı olarak görev yapacaktır.
 * Mailleri özetleme, task çıkarma ve taslak yanıt oluşturma işlevlerini yürütür.
 */

export class GeminiAiService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
  }

  /**
   * Gelen bir maili kısaca özetler.
   */
  async summarizeEmail(emailBody: string): Promise<string> {
    // Skeleton: Gerçek entegrasyonda Gemini REST API veya SDK kullanılacak.
    /*
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Aşağıdaki e-postayı 2 cümle ile özetle: ${emailBody}` }] }]
      })
    })
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
    */
    
    // MOCK RESPONSE
    return "Müşteri fatura kesme modülünde hata yaşadığını belirterek acil destek talep ediyor."
  }

  /**
   * Mail içeriğinden Kanban görevleri (Task) çıkarır.
   */
  async extractTasks(emailBody: string): Promise<{ title: string, priority: 'low' | 'medium' | 'high' | 'urgent' }[]> {
    // MOCK RESPONSE
    if (emailBody.includes('fatura')) {
      return [
        { title: 'Fatura modülü hatasını kontrol et', priority: 'urgent' }
      ]
    }
    if (emailBody.includes('eğitim')) {
      return [
        { title: 'Yeni kullanıcı eğitim takvimini planla', priority: 'medium' }
      ]
    }
    return []
  }

  /**
   * Mail içeriğine göre otomatik profesyonel bir yanıt taslağı oluşturur.
   */
  async draftReply(emailBody: string, context?: string): Promise<string> {
    // MOCK RESPONSE
    return `Merhaba, \n\nYaşadığınız sorunu anlıyorum ve hemen teknik ekibimize iletiyorum. Konuyla ilgili gelişmelerden sizi en kısa sürede haberdar edeceğiz.\n\nİyi çalışmalar dilerim.`
  }
}

export const geminiAiService = new GeminiAiService()
