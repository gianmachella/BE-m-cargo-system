const newClientEmail = (data) => {
  console.log(data);

  return `
  <div style="background-color: #f5f5f5; padding: 20px;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">
      <!-- Header -->
      <tr>
        <td style="background-color: #bd1c2c; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <img src="https://globalcargous.com/images/Logo-GC-white.png" alt="Global Cargo Logo" width="400" style="display: block; margin: auto;">
        </td>
      </tr>

      <!-- Main Content -->
      <tr>
        <td style="padding: 20px; text-align: center; color: #3b3a3c;">
          <h2 style="margin-bottom: 10px;">¡Bienvenido ${data.firstName}!</h2>
          <p style="font-size: 16px; color: #737373;">
            Estimado ${data.firstName} ${data.lastName}, <br> ¡Bienvenido a Global Cargo! 🎉 Gracias por registrarte con nosotros. Ahora puedes disfrutar de nuestros servicios de envíos con seguridad y confianza. Si necesitas asistencia, no dudes en contactarnos. ¡Estamos aquí para ayudarte!
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
      <td style="background-color: #3b3a3c; padding: 15px; text-align: center; color: #ffffff; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
        <p style="margin: 0; font-size: 14px;">© 2025 Global Cargo. Todos los derechos reservados.</p>
        <p style="margin: 5px 0 0; font-size: 14px;">📍 175 W 2700 S, South Salt Lake, UT 84115</p>
        <p style="margin: 5px 0 0; font-size: 14px;">📧 info@globalcargous.com</p>
        <p style="margin: 5px 0 0; font-size: 14px;">📱 +1 (801) 499-6174</p>
      </td>
      </tr>
    </table>
  </div>`;
};

module.exports = newClientEmail;
