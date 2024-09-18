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
          loadRequests()
        } else {
            document.getElementById('content-area').innerHTML = '<img src="img/inst.png" id="fondo-inicio">';
          document.getElementById('solicitudes-link').style.display = 'none';
          document.getElementById('clientes-link').style.display = 'none';
          document.getElementById('productos-link').style.display='none';
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
  document.getElementById('mi-perfil-link').addEventListener('click', function(event) {
    event.preventDefault();

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
            const userId = data._id;
            console.log(data.userId);
            
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
                    ? `<div id="stars"><h3>Mis Estrellas: ${pointsData.totalPoints}</h3></div>` 
                    : `<h3>Aún no has ganado estrellas</h3>`;

                document.getElementById('content-area').innerHTML = `
                    ${pointsBanner}
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div style="flex: 1; margin-right: 20px;">
                            <h3>Datos personales</h3>
                            <p><strong>Nombre:</strong> ${data.name}</p>
                            <p><strong>Apellido:</strong> ${data.lastName}</p>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Documento:</strong> ${data.doc}</p>
                            <p><strong>Tel.:</strong> ${data.phone}</p>
                            <p><strong>Dirección:</strong> ${data.address}</p>
                        </div>
                        <div style="flex: 1;">
                            <h3>Editar datos</h3>
                            <label for="edit-name">Nombre:</label>
                            <input type="text" id="edit-name" value="${data.name}" style="display: block; margin-bottom: 10px;" />
                            <label for="edit-lastName">Apellido:</label>
                            <input type="text" id="edit-lastName" value="${data.lastName}" style="display: block; margin-bottom: 10px;" />
                            <label for="edit-doc">Documento:</label>
                            <input type="text" id="edit-doc" value="${data.doc}" style="display: block; margin-bottom: 20px;" />
                            <label for="edit-phone">Teléfono:</label>
                            <input type="text" id="edit-phone" value="${data.phone}" style="display: block; margin-bottom: 20px;" />
                            <label for="edit-address">Dirección:</label>
                            <input type="text" id="edit-address" value="${data.address}" style="display: block; margin-bottom: 20px;" />
                            
                        </div>
                    </div>
                    <label>
                                <input type="checkbox" id="use-current-location" />
                                ¿Usar ubicación actual como predeterminada?
                            </label>
                    <div id="map" style="height: 300px; width: 100%;"></div>
                    <button id="save-button">Guardar cambios</button>
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
                    address: address
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
});

document.getElementById('solicitar-link').addEventListener('click', function(event) {
    event.preventDefault(); 

    document.getElementById('content-area').innerHTML = `
       <di id="requ-content">
    <h2>Redactar Solicitud</h2>
        <div id="formulario-solicitud"> 
            <form id="request-form">
                <label for="request-title">Razón/detalle/asunto:</label>
                <input type="text" id="request-title" placeholder="Razón/detalle/asunto" required>
                <p>Detalla el contenido de la solicitud</p>
                <textarea id="request-detail" placeholder="Describe detalladamente tu solicitud..." required></textarea>
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
});

document.getElementById('listar-link').addEventListener('click', function(event) {
    event.preventDefault();

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
});

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