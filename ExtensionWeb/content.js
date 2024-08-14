let textoConsultado = '';
let consultaResultado = '';
let reportBoolean = 'NoReportadoPorUsuario'; //cambiarlo por un boolean 

function esEmailPaginaWebTelefono(texto) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPaginaWeb = /^(http|https):\/\/([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;
  const regexTelefono = /^\+?[1-9]\d{1,14}$/;

  return regexEmail.test(texto) || regexPaginaWeb.test(texto) || regexTelefono.test(texto);
}

function obtenerTextoSeleccionado() {
  let texto = window.getSelection().toString().trim();
  return texto;
}

function mostrarContextMenu(event, textoSeleccionado, isAuthenticated, xPos, yPos) {
  let contextMenu = document.getElementById('custom-context-menu');
  if (contextMenu) {
    contextMenu.remove();
  }

  contextMenu = document.createElement('div');
  contextMenu.id = 'custom-context-menu';
  contextMenu.className = 'context-menu';

  const opciones = [];

  if (textoConsultado !== textoSeleccionado) {
    opciones.push({ texto: 'Consultar', icono: 'consultar', accion: () => consultarReporte(textoSeleccionado, event) }); //cambiar esto
  } else {
    console.log(reportBoolean)
    if (consultaResultado === 'malicioso' && reportBoolean === 'NoReportadoPorUsuario') {
      opciones.push({ texto: 'Aprobar', icono: 'aprobar', accion: () => {
        // acá iria la lógica para aprobar
        console.log(`Aprobar: ${textoSeleccionado}`);
        contextMenu.remove();
      }});
      opciones.push({ texto: 'Rechazar', icono: 'rechazar', accion: () => {
        // aca la de rechazar
        console.log(`Rechazar: ${textoSeleccionado}`);
        contextMenu.remove();
        
      }});
    } else {
      if (isAuthenticated && reportBoolean === 'NoReportadoPorUsuario') {
        opciones.push({ texto: 'Reportar', icono: 'reportar', accion: () => {
          abrirFormularioReporte(textoSeleccionado);
          contextMenu.remove();
          
        }});
      }else{
        opciones.push({texto: 'Ya has reportado este contenido'})
        contextMenu.remove();
        
      }
    }
  }

  opciones.forEach(opcion => {
    const boton = document.createElement('div');
    boton.className = 'context-menu-item';
    boton.innerHTML = `<i class="${opcion.icono}"></i> ${opcion.texto}`;
    boton.onclick = () => {
      opcion.accion();
      if (opcion.texto !== 'Consultar') {
        contextMenu.remove();
      }
    };
    contextMenu.appendChild(boton);
  });

  document.body.appendChild(contextMenu);

  contextMenu.style.top = `${yPos}px`;
  contextMenu.style.left = `${xPos}px`;

  document.addEventListener('click', function cerrarMenu(event) {
    if (!contextMenu.contains(event.target)) {
      contextMenu.remove();
      document.removeEventListener('click', cerrarMenu);
    }
  });
}

function manejarSeleccion(event) {
  setTimeout(() => {
    let textoSeleccionado = obtenerTextoSeleccionado();

    if (textoSeleccionado && esEmailPaginaWebTelefono(textoSeleccionado)) {
      chrome.storage.local.get(['authenticated'], function(result) {
        const isAuthenticated = result.authenticated;
        mostrarContextMenu(event, textoSeleccionado, isAuthenticated, event.clientX, event.clientY);
      });
    }
  }, 100);
}

function abrirFormularioReporte(textoSeleccionado) {
  let tipo = '';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textoSeleccionado)) {
    tipo = 'email';
  } else if (/^(http|https):\/\/([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/.test(textoSeleccionado)) {
    tipo = 'url';
  } else if (/^\+?[1-9]\d{1,14}$/.test(textoSeleccionado)) {
    tipo = 'telefono';
  }
  chrome.runtime.sendMessage({
    action: 'abrirFormularioReporte',
    tipo: tipo,
    contenido: textoSeleccionado
  });
}

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
          console.log(result.user._id)
          console.log(data.data.user._id)
          if (result.user._id == data.data.user._id) {
            mostrarNotificacion('Ya has reportado a este contenido', 'yellow');
            reportBoolean = 'ReportadoPorUsuario'
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

function mostrarNotificacion(mensaje, colorFondo) {
  let notificacion = document.getElementById('custom-notificacion');
  if (notificacion) {
    notificacion.remove();
  }

  notificacion = document.createElement('div');
  notificacion.id = 'custom-notificacion';
  notificacion.className = 'custom-notificacion';
  notificacion.textContent = mensaje;
  notificacion.style.backgroundColor = colorFondo;

  document.body.appendChild(notificacion);

  notificacion.style.top = `${window.scrollY + 10}px`;
  notificacion.style.left = `${(window.innerWidth - notificacion.offsetWidth) / 2}px`;

  setTimeout(() => {
    if (notificacion) {
      notificacion.remove();
    }
  }, 4000);
}

document.addEventListener('mouseup', manejarSeleccion);

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.authenticated) {
    document.removeEventListener('mouseup', manejarSeleccion);
    document.addEventListener('mouseup', manejarSeleccion);
  }
});
