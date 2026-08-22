export const createGoogleMapsUrl = (lat, lng) => {
  return `https://www.google.com/maps?q=${lat},${lng}`;
};

export const createEmergencyMessage = (lat, lng, address = '', customNote = '') => {
  const mapUrl = createGoogleMapsUrl(lat, lng);
  const locationText = address ? `📍 Location: ${address}\n🔗 Maps: ${mapUrl}` : `🔗 Live Location: ${mapUrl}`;
  const noteText = customNote ? `\n\nNote: ${customNote}` : '';
  
  return `🚨 EMERGENCY SOS ALERT! 🚨\nI am in danger and need urgent assistance!${noteText}\n\n${locationText}\n\nPlease help or contact local emergency services immediately!`;
};

export const getWhatsAppShareUrl = (phone = '', message = '') => {
  const encodedMsg = encodeURIComponent(message);
  if (phone) {
    // Strip non-digits
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
  }
  return `https://api.whatsapp.com/send?text=${encodedMsg}`;
};

export const getSmsShareUrl = (phone = '', message = '') => {
  const encodedMsg = encodeURIComponent(message);
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  // Native SMS schema fallback
  return `sms:${cleanPhone}?body=${encodedMsg}`;
};

export const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      textArea.remove();
      return true;
    } catch (error) {
      textArea.remove();
      return false;
    }
  }
};
