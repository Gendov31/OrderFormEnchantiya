document.addEventListener('DOMContentLoaded', function() {
    // Get the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderid');

    if (orderId) {
        // Prepare the data to send
        const data = {
            orderId: orderId
        };

        // Send to webhook
        fetch('https://hook.eu2.make.com/e3y6ili9rcyg90unrml3434bdo327nja', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Thank you for your order');
        })
        .catch(error => {
            console.error('Error sending order confirmation:', error);
        });
    } else {
        console.error('No order ID found in URL');
    }
}); 