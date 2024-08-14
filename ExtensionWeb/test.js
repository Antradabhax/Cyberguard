function consultarReporte(textoSeleccionado, event) {
    chrome.storage.local.get('user', function(result) {
      const currentUser = result.user;
  
      fetch(`http://localhost:4000/reports/reportByContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: textoSeleccionado })
      })
        .then(response => response.json())
        .then(data => {
          textoConsultado = textoSeleccionado;
          if (data.status == 200) {
            consultaResultado = 'malicioso';
            usuarioReporto = data.data.reportedBy.some(reporte => reporte.userId === currentUser._id);
            if (usuarioReporto) {
              mostrarNotificacion('Ya has reportado a este contenido', 'yellow');
            } else {
              mostrarNotificacion(`El contenido se encuentra REPORTADO, posee ${data.data.likes} aprobaciones`, 'red');
            }
          } else {
            consultaResultado = 'no_verificado';
            mostrarNotificacion('El contenido no está verificado', 'yellow');
          }
          mostrarContextMenu(event, textoSeleccionado, true, event.clientX, event.clientY); // Actualizar el menú contextual en la misma posición
        })
        .catch(error => {
          console.error('Error:', error);
          mostrarNotificacion('Error al consultar el reporte', 'gray');
        });
    });
  }