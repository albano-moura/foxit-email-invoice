const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const invoices = require('../data/invoices.json');

router.get('/', function(req, res, next) {
  res.render('invoice-list', {
    invoices: invoices,
    success: req.query['success'],
    error: req.query['error'],
  });
});

router.get('/:id', function(req, res, next) {
  const invoice = invoices.find(invoice => invoice.id === req.params['id']);
  if (!invoice) {
    res.redirect('/invoices');
  }
  const date = new Date().toLocaleDateString("en", {
    year:"numeric",
    day:"2-digit",
    month:"2-digit",
  });
  res.render('invoice-single', { invoice, date });
});

router.get('/:id/email', function(req, res, next) {
  const invoice = invoices.find(invoice => invoice.id === req.params['id']);
  if (!invoice) {
    res.redirect('/invoices?error=1');
  }

  // TODO: Call cli to get invoice

  // Use mailer to send invoice
  const transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "fa624ce73462e6",
      pass: "4a1231604de840"
    }
  });

  const message = {
    from: 'accounting@example.com',
    to: invoice.contact_email,
    subject: 'Reminder: Your Invoice from Tiller, Inc. is Due',
    html: `<p>Hey ${invoice.contact_name},</p><p>I just wanted to remind you that your invoice for last month's services is now due. I've attached it here for your convenience.</p><p>Thanks for your business!</p>`,
    attachments: [
      {
        filename: 'invoice.pdf',
        path: __dirname + '/../invoices/sample-invoice.pdf',
      }
    ]
  };

  transport.sendMail(message, function (err, info) {
    if (err) {
      // If failure
      res.redirect('/invoices?error=1');
    }
    // If success
    res.redirect('/invoices?success=1');
  });
});

module.exports = router;
