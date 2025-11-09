export const generateWhatsAppLink = (productName: string): string => {
    const phoneNumber = "5511976810216";
    const baseText = "gostaria de negociar o preço de";
    const fullText = `${baseText} ${productName}.`;
    const encodedText = encodeURIComponent(fullText);
    return `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedText}`;
  };
  