import Taro from '@tarojs/taro'

// 身份证 OCR 识别结果
export interface IdCardOcrResult {
  name: string
  idNumber: string
}

/**
 * 上传身份证并 OCR 识别
 */
export async function recognizeIdCard(imagePath: string): Promise<IdCardOcrResult | null> {
  try {
    const res = await Taro.uploadFile({
      url: '/api/ocr/idcard',
      filePath: imagePath,
      name: 'image',
    })

    if (res.statusCode === 200) {
      const data = JSON.parse(res.data)
      if (data.success && data.name && data.idNumber) {
        return {
          name: data.name,
          idNumber: data.idNumber,
        }
      }
    }
    return null
  } catch {
    return null
  }
}
