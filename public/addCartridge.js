document.addEventListener('DOMContentLoaded', function() {
            fetch('/api/printers')
                .then(response => response.json())
                .then(data => {
                    const printerSelect = document.getElementById('printer-id');
                    data.forEach(printer => {
                        const option = document.createElement('option');
                        option.value = printer.pid; // Set the value to the printer ID
                        option.text = printer.pname; // Set the text to the printer name
                        printerSelect.appendChild(option);
                    });
                })
                .catch(error => {
                    console.error('Error fetching printers:', error);
                });

            document.getElementById('add-cartridge-form').addEventListener('submit', function(event) {
                event.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                    name: formData.get('name'),
                    printer_id: formData.get('printer_id'), // Get the selected printer ID
                    cost: formData.get('cost'),
                    vendor: formData.get('vendor'),
                    yield: formData.get('yield'),
                    quantity: formData.get('quantity')
                };

                fetch('/api/cartridges', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Error adding cartridge:', error);
                });
            });
        });
