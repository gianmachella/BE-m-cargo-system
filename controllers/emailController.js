const { Resend } = require("resend");
const newClientEmail = require("../emailTemplate/newClientEmail");
const newShipmentEmail = require("../emailTemplate/newShippedEmail");

const resend = new Resend(process.env.RESEND_APY_KEY);

const sendEmail = async (req, res) => {
  const { to, data, type, subject, clientData, receiverData } = req.body;

  const emailTemplates = {
    newClient: (data) => newClientEmail(data),
    newShipment: (data) => newShipmentEmail(data, clientData, receiverData),
  };

  const emailHtml = emailTemplates[type] ? emailTemplates[type](data) : null;

  if (!emailHtml) {
    return res.status(400).json({ error: "Tipo de email inválido." });
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: "info@globalcargous.com",
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    if (error) {
      return res.status(500).json({ error });
    }

    res
      .status(200)
      .json({ message: "Email enviado correctamente", data: emailData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { sendEmail };
