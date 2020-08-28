const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const welcomeMessage = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sachi8791@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to Task Manager API, ${name}.
        Let us know how are you liking our app.`
    });
}

const deletionMessage = (email, name) => {
    sgMail.send({
        to: email,
        from: 'sachi8791@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Goodbye ${name}. We hope to see you sometime back soon. `
    })
}

module.exports = {
    welcomeMessage,
    deletionMessage
}