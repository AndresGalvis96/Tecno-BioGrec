document.addEventListener('DOMContentLoaded', function() {
    fetch('/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data) {
        const userType = data.type;
        console.log(data.type);
        if (userType === 'admin') {
          document.getElementById('mi-perfil-link').style.display = 'none';
          document.getElementById('solicitar-link').style.display = 'none';
          document.getElementById('listar-link').style.display = 'none';
          document.getElementById('asistencia-link').style.display = 'none'; 
          
          document.getElementById('solicitudes-link').style.display = 'block'; 
          document.getElementById('clientes-link').style.display = 'block'; 
          loadProductManagement();
        } else {
          document.getElementById('solicitudes-link').style.display = 'none';
          document.getElementById('clientes-link').style.display = 'none';
          document.getElementById('productos-link').style.display='none';
          pageOne();
        }
      } else {
        document.getElementById('content-area').innerHTML = '<p>No se pudieron obtener los datos del usuario.</p>';
      }
    })
    .catch(error => {
      console.error('Error al obtener los datos del usuario:', error);
      document.getElementById('content-area').innerHTML = '<p>Error al cargar los datos del usuario.</p>';
    });

  });
  async function pageOne() {
    //const points = await consultarPuntos();
    document.getElementById('content-area').innerHTML = `
    <div id="content-area">
  <div class="points-container">
    <div class="points-display">
      <div class="star-icon">⭐</div>
      <div class="points-info">
        <h2 class="total-points">1000</h2>
        <p class="points-label">Puntos acumulados</p> <a onClick="listar();" class="view-points">Ver todos los puntos</a>
      </div>
     
    </div>
  </div>

  <div class="earn-points-container">
    <h3 class="section-title">Ganar puntos</h3>
    <a href="#" onClick="solicitar();" class="request-link">
      <div class="link-icon">⭐</div>
      <div class="link-text">
        Redactar solicitud
        <p class="link-subtext">Solicitudes, sugerencias, quejas, reclamos</p>
      </div>
    </a>

    <h3 class="section-title">Gestionar mis datos</h3>
    <a href="#" onClick="profile();" class="profile-link">
      <div class="link-icon">👤</div>
      <div class="link-text">
        Ir a mi perfil
        <p class="link-subtext">Editar mis datos y mi ubicación</p>
      </div>
    </a>
  </div>
</div>

    `
  }
  async function consultarPuntos() {
    const userId = document.cookie;
    console.log(userId);
    const response = await fetch(`/auth/points/${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener los puntos');
        }
        return response.json();
    })
    .then(pointsData => {
        return pointsData.points; 
    })
    .catch(error => {
        console.error('Error:', error);
        return 0; 
    });
}
  document.getElementById('mi-perfil-link').addEventListener('click', function(event) {
    event.preventDefault();
    profile();
});
function profile() {
    fetch('/auth/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            let selectedUserType = data.type || ''; 

            const userId = data._id;

            fetch(`/auth/points/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                }
            })
            .then(response => response.json())
            .then(pointsData => {
                const pointsBanner = pointsData.totalPoints > 0 
                    ? `<div id="stars"><h4>Mis Estrellas: ${pointsData.totalPoints}</h4></div>` 
                    : `<h3>Aún no has ganado estrellas</h3>`;

                    document.getElementById('content-area').innerHTML = `
                    ${pointsBanner}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="flex: 1;">
                            <h3>Datos personales</h3>

                            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <div style="flex: 1;">
                                    <label for="edit-name">Nombre:</label>
                                    <input type="text" id="edit-name" value="${data.name}" style="width: 100%; padding: 8px;" />
                                </div>
                                <div style="flex: 1;">
                                    <label for="edit-lastName">Apellido:</label>
                                    <input type="text" id="edit-lastName" value="${data.lastName}" style="width: 100%; padding: 8px;" />
                                </div>
                            </div>
                
                            <!-- Fila para Documento y Dirección -->
                            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                                <div style="flex: 1;">
                                    <label for="edit-doc">Documento:</label>
                                    <input type="text" id="edit-doc" value="${data.doc}" style="width: 100%; padding: 8px;" />
                                </div>
                                <div style="flex: 1;">
                                    <label for="edit-address">Dirección:</label>
                                    <input type="text" id="edit-address" value="${data.address}" style="width: 100%; padding: 8px;" />
                                </div>
                            </div>
                
                            <!-- Campo para Teléfono (toda la fila) -->
                            <div style="margin-bottom: 20px;">
                                <label for="edit-phone">Teléfono:</label>
                                <input type="text" id="edit-phone" value="${data.phone}" style="width: 100%; padding: 8px;" />
                            </div>
                
                            <button id="user-type-button">Elegir tipo de usuario</button>
                            <p>Tipo de usuario seleccionado: <span id="selected-user-type">${selectedUserType}</span></p>
                        </div>
                    </div>
                
                    <label>
                        <input type="checkbox" id="use-current-location" />
                        ¿Usar ubicación actual como predeterminada?
                    </label>
                    <div id="map" style="height: 300px; width: 100%;"></div>
                    <button id="save-button">Guardar cambios</button>
                
                    <!-- Ventana flotante para elegir tipo de usuario -->
                    <div id="user-type-modal" class="modal">
                        <div class="modal-content">
                            <div class="user-type-grid">
                                <div class="user-type-option" data-type="Conjunto residencial">
                                    <img src="/img/simple-house.jpg" alt="Conjunto residencial">
                                    <p>Conjunto residencial</p>
                                </div>
                                <div class="user-type-option" data-type="Edificio">
                                    <img src="/img/3650377.png" alt="Edificio">
                                    <p>Edificio</p>
                                </div>
                                <div class="user-type-option" data-type="Usuario común">
                                    <img src="/img/5988264.png" alt="Usuario común">
                                    <p>Usuario común</p>
                                </div>
                                <div class="user-type-option" data-type="Empresa">
                                    <img src="/img/company-23.png" alt="Empresa">
                                    <p>Empresa</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                

                let lat, lon;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;

                        const map = L.map('map').setView([lat, lon], 14);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);

                        L.marker([lat, lon]).addTo(map)
                            .bindPopup('Estás aquí')
                            .openPopup();
                    });
                }

                document.getElementById('user-type-button').addEventListener('click', function() {
                    document.getElementById('user-type-modal').style.display = 'block';
                });

                document.querySelectorAll('.user-type-option').forEach(option => {
                    option.addEventListener('click', () => {
                        selectedUserType = option.getAttribute('data-type');
                        document.getElementById('selected-user-type').textContent = selectedUserType;
                        document.getElementById('user-type-modal').style.display = 'none';
                    });
                });

                document.getElementById('save-button').addEventListener('click', function() {
                    const name = document.getElementById('edit-name').value;
                    const lastName = document.getElementById('edit-lastName').value;
                    const doc = document.getElementById('edit-doc').value;
                    const phone = document.getElementById('edit-phone').value;
                    const address = document.getElementById('edit-address').value;
                    const useCurrentLocation = document.getElementById('use-current-location').checked;

                    const updateData = {
                        name: name,
                        lastName: lastName,
                        doc: doc,
                        phone: phone,
                        address: address,
                        type: selectedUserType
                    };

                    if (useCurrentLocation && lat && lon) {
                        updateData.location = { latitude: lat, longitude: lon };
                    }

                    fetch('/auth/me', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
                        },
                        body: JSON.stringify(updateData)
                    })
                    .then(response => response.json())
                    .then(updatedData => {
                        if (updatedData) {
                            alert('Datos actualizados exitosamente.');
                            location.reload();
                        } else {
                            alert('No se pudieron actualizar los datos.');
                        }
                    })
                    .catch(error => {
                        console.error('Error al actualizar los datos del usuario:', error);
                        alert('Error al guardar los cambios.');
                    });
                });
            })
            .catch(error => {
                console.error('Error al obtener los puntos del usuario:', error);
                document.getElementById('content-area').innerHTML = '<p>Error al cargar los puntos del usuario.</p>';
            });
        } else {
            document.getElementById('content-area').innerHTML = '<p>No se pudieron obtener los datos del usuario.</p>';
        }
    })
    .catch(error => {
        console.error('Error al obtener los datos del usuario:', error);
        document.getElementById('content-area').innerHTML = '<p>Error al cargar los datos del usuario.</p>';
    });
}

document.getElementById('solicitar-link').addEventListener('click', function(event) {
    event.preventDefault(); 
    solicitar();
 
});
function solicitar() {
    document.getElementById('content-area').innerHTML = `
    <div id="requ-content">
        <h2>Información de la solicitud</h2>
        <div id="formulario-solicitud"> 
            <form id="request-form">
                <select id="request-title" required>
                    <option value="" disabled selected>Seleccione un tipo</option>
                    <option value="Recolección de material">Recolección de material</option>
                    <option value="Alquiler-compra de contenedor">Alquiler-compra de contenedor</option>
                    <option value="Sugerencias">Sugerencias</option>
                    <option value="Quejas-Reclamos">Quejas-Reclamos</option>
                </select>
                <h5>Detalla el contenido de la solicitud</h5>
                <textarea id="request-detail" placeholder="

    ->Tipo de material/Cantidad/Peso.

    ->Sugerencias.

    ->Alquilar/Comprar contenedor.

    ->Detalla tu queja o reclamo.
                " required></textarea>
                <label>
                    <input type="checkbox" id="use-current-location" />
                    ¿Usar ubicación actual para esta solicitud?
                </label>
                <button type="submit">Enviar Solicitud</button>
            </form>
        </div>
    </div>
    `;

    document.getElementById('request-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('request-title').value;
        const detail = document.getElementById('request-detail').value;
        const useCurrentLocation = document.getElementById('use-current-location').checked;

        if (!title || !detail) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        if (useCurrentLocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                sendRequest({ title, detail, location });
            }, function(error) {
                console.error('Error al obtener la ubicación:', error);
                alert('No se pudo obtener la ubicación.');
                sendRequest({ title, detail });
            });
        } else {
            sendRequest({ title, detail });
        }
    });

    function sendRequest(requestData) {
        fetch('/auth/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                alert('Solicitud enviada exitosamente.');
                document.getElementById('request-title').value = '';
                document.getElementById('request-detail').value = '';
            } else {
                alert('No se pudo enviar la solicitud.');
            }
        })
        .catch(error => {
            console.error('Error al enviar la solicitud:', error);
            alert('Error al enviar la solicitud.');
        });
    }
}

document.getElementById('listar-link').addEventListener('click', function(event) {
   event.preventDefault();
   listar();
});
function listar(){
    fetch('/auth/requests/all', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => response.json())
    .then(data => {
        const requestsList = document.getElementById('content-area');
        requestsList.innerHTML = ''; 
        const titl= document.createElement('h2');
        titl.innerHTML='<h3>Solicitudes</h3>';
        if (data && data.length > 0) {
            console.log(data);
            requestsList.appendChild(titl);
            data.forEach(request => {
                const date = new Date(request.createdAt);
                const formattedDate = isNaN(date.getTime()) ? 'Fecha inválida' : date.toLocaleDateString();
                
                const ratingText = request.rating !== null ? request.rating : '<sin puntos asignados>';
            
                const requestElement = document.createElement('div');
                requestElement.innerHTML = `
  
                <div class="request-card">
                    <div class="request-title">${request.title}</div>
                    <div class="request-date">${formattedDate}</div>
                    <div class="request-rating">#Estrellas asignadas: ${ratingText}</div>
                </div>
                ` ;
                requestsList.appendChild(requestElement);
            });
            
        } else {
            requestsList.innerHTML = '<p>No se encontraron solicitudes.</p>';
        }
    })
    .catch(error => {
        console.error('Error al listar las solicitudes:', error);
        alert('Error al listar las solicitudes.');
    });
}
document.getElementById('cerrar-sesion').addEventListener('click', function(event) {
    event.preventDefault();

    fetch('/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")
        }
    })
    .then(response => {
        if (response.ok) {
            document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            window.location.href = '/';
        } else {
            alert('Error al cerrar sesión.');
        }
    })
    .catch(error => {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión.');
    });
});
document.getElementById('asistencia-link').addEventListener('click',function(event) {
    event.preventDefault();
    asistencia();
})
function asistencia() {
    const content =document.getElementById('content-area');
    content.innerHTML=`
    <div class="assistance-container">
        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                     <img src="/img/can.png" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Adquirir contenedor</h3>
                <p>Compra o alquila un contenedor.</p>
            </div>
        </div>

        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                    <img src="/img/gift.jpg" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Programa de puntos</h3>
                <p>Descubre cómo redimir tus puntos.</p>
            </div>
        </div>

        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                    <img src="/img/assist.png" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Asistencia</h3>
                <p>Comunícate con nosotros a través de whatsapp.</p>
            </div>
        </div>

        <div class="assistance-option">
            <div class="icon-container">
                <div class="icon-circle">
                     <img src="/img/info.PNG" alt="trash">
                </div>
            </div>
            <div class="option-text">
                <h3>Información de uso</h3>
                <p>Encuentra más información sobre el uso de tu información.</p>
            </div>
        </div>
    </div>
    `
}