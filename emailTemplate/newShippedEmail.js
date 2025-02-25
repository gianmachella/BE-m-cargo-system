const newShippedEmail = (data, clientData, receiverData) => {
  return `
 <div style="background-color: #f5f5f5; padding: 20px;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <tr>
      <td style="background-color: #bd1c2c; padding: 20px; text-align: center; border-top-left-radius: 8px; border-top-right-radius: 8px;">
        <img src="https://globalcargous.com/images/Logo-GC-white.png" alt="Global Cargo Logo" width="400" style="display: block; margin: auto;">
      </td>
    </tr>

    <!-- Main Content -->
    <tr>
      <td style="padding: 20px; color: #3b3a3c;">
      <h1 style="text-align: center;"></h1>Envío Confirmado</h1>
      <p style="font-size: 16px; color: #737373;">Hola ${
        clientData.firstName
      } tu envio esta registrado.</p>
      <p style="font-size: 20px; color:rgb(51, 51, 51);">Número de Envío: ${
        data.shipmentNumber
      }</p>
        <h2 style="text-align: center;">📦 Detalles de tu Envío</h2>
        <table width="100%" border="1" cellpadding="5" cellspacing="0" style="margin-top: 10px; font-size: 16px; color: #3b3a3c; text-align: left; border-collapse: collapse;">
          <tr>
            <td><strong>Número de Envío:</strong></td><td>${
              data.shipmentNumber
            }</td>
            <td><strong>Fecha:</strong></td><td>${data.createdAt}</td>
          </tr>
          <tr>
            <td><strong>Nombre Remitente:</strong></td><td>${
              clientData.firstName
            } ${clientData.lastName}</td>
            <td><strong>Teléfono Remitente:</strong></td><td>${
              clientData.phone
            }</td>
          </tr>
          <tr>
            <td><strong>Nombre Destinatario:</strong></td><td>${
              receiverData.firstName
            } ${receiverData.lastName}</td>
            <td><strong>Teléfono Destinatario:</strong></td><td>${
              receiverData.phone
            }</td>
          </tr>
          <tr>
            <td><strong>Dirección de Destino:</strong></td><td colspan="3">${
              receiverData.address
            }</td>
          </tr>
          <tr>
            <td><strong>Ciudad:</strong></td><td>${
              receiverData.city ? receiverData.city : ""
            }</td>
            <td><strong>Estado/Departamento:</strong></td><td>${
              receiverData.state ? receiverData.state : ""
            }</td>
          </tr>
          <tr>
            <td><strong>País:</strong></td><td>${
              receiverData.country ? receiverData.country : ""
            }</td>
            <td><strong>Estatus:</strong></td><td>${data.status}</td>
          </tr>
          <tr>
            <td><strong>Total de Cajas:</strong></td><td>${data.totalBoxes}</td>
            <td><strong>Total de Peso:</strong></td><td>${
              data.totalWeight
            } kg</td>
          </tr>
          <tr>
            <td><strong>Total de Pies Cuadrados:</strong></td><td>${
              data.totalVolume
            } ft²</td>
            <td><strong>Asegurado:</strong></td><td>${data.insured}</td>
          </tr>
          <tr>
            <td><strong>Valor Declarado:</strong></td><td>${
              data.declaredValue
            }</td>
            <td><strong>Valor Pagado:</strong></td><td>${data.valuePaid}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; font-size: 16px; color: #737373;">
          Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
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

module.exports = newShippedEmail;
