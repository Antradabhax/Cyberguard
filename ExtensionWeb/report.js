document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get('tipo');
    const contenido = params.get('contenido');
    if (tipo) {
        document.getElementById('tipoContenido').value = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
    if (contenido) {
        document.getElementById('contenidoReportar').value = contenido;
    }

    document.getElementById('reportForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const tipoContenido = document.getElementById('tipoContenido').value.toLowerCase();
        const contenidoReportar = document.getElementById('contenidoReportar').value;
        const queSimula = document.getElementById('queSimula').value;
        const descripcion = document.getElementById('descripcion').value;

        // Obtiene el token del almacenamiento local de Chrome
        chrome.storage.local.get(['token', 'user'], function(result) {
            const token = JSON.stringify(result.token.token).replace(/^"|"$/g, '');
            const user = result.user._id;
            if (!token) {
                alert('Usuario no autenticado. Por favor, inicie sesión.');
                return;
            }

            const data = {
                user: user,
                type: tipoContenido,
                content: contenidoReportar,
                pretends: queSimula,
                description: descripcion
            };

            fetch('http://localhost:4000/reports/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status == 201) {
                    alert('Reporte enviado con éxito.');
                    window.close(); // Cierra la ventana del popup
                } else {
                    alert('Error al enviar el reporte: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al enviar el reporte. Intente nuevamente más tarde.');
            });
        });
    });
});
