window.onload = function() {
	/* Locación inicial por defecto, San Francisco.*/
	const initialLat = 37.77; // Latitud de San Francisco.
	const initialLng = -122.42; // Longitud de San Francisco.
	const initialZoom = 15; // Nivel de zoom inicial.

	const map = L.map('map', {
		center: [initialLat, initialLng], // Coordenads de centro
		zoom: initialZoom, // Nivel de zoom inicial
		minZoom: 1, // Puedes ajustar el zoom mínimo
		maxZoom: 18, // Puedes ajustar el zoom máximo (generalmente el de la capa de tiles)
		zoomControl: true, // Muestra los controles de zoom (+/-)
		attributionControl: true, // Muestra la atribución (OpenStreetMap, etc)

		dragging: false, // Evita que el usuario arrastre el mapa con el mouse
		scrollWheelZoom: false, // Evita que el usuario haga zoom con la rueda del mouse
		doubleClickZoom: false, // Evita que el usuario haga zoom con doble click
		boxZoom: false, // Evita que el usuario haga zoom arrastrando un cuadro
		keyboard: false // Deshabilita la navegación por teclado de Leaflet
	});
	/*
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    maxZoom: 19,
	    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	}).addTo(map);
	*/
	// Crear una capa de mapa de Google Maps (default: mapa)
	
	const googleMapsViews = {
                'map': 'm',
                'satellite': 's',
                'hybrid': 'y'
            };
    L.tileLayer(`https://{s}.google.com/vt/lyrs=${googleMapsViews['hybrid']}&x={x}&y={y}&z={z}`, {
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Map data &copy; <a href="https://www.google.com/intl/en_US/help/terms_maps.html">Google</a>',
         
        }
    ).addTo(map);
	
	const carImageUrl = 'https://cdn-icons-png.flaticon.com/512/1047/1047003.png'; // Una imagen de auto simple (puedes cambiarla)
	const carIconSize = [50, 50]; // Tamaño del ícono [ancho, alto]

	// Crear un ícono personalizado para el auto
	const carIcon = L.icon({
	    iconUrl: carImageUrl,
	    iconSize: carIconSize,    // Tamaño del icono en píxeles
	    iconAnchor: [carIconSize[0] / 2, carIconSize[1] / 2], // Punto del icono que corresponderá a la ubicación del marcador
	    popupAnchor: [0, -carIconSize[1] / 2] // Punto donde se abrirá el popup si lo hubiera
	});

	// Crear un marcador para el auto en la posición inicial.
	let carMarker = L.marker([initialLat, initialLng], { icon: carIcon}).addTo(map);

	// Variables para el movimiento del auto.
	const moveSpeed = 0.00005; // Velocidad de movimiento del auto
	const turnSpeed = 5; // Velocidad de giro en grados (ajusta este valor)
	let currentHeading = 0; // Dirección actual del auto en grados (0 = Norte, 90 = Este, etc)

	// Función para actualizar la posición y rotación del auto.
	function updateCarPosition() {
		const carElement = carMarker.getElement();

		if (carElement) {
			console.log("Elemento del auto para rotar: ", carElement);
			console.log("Aplicando rotación: ", currentHeading + "deg");
			
			const leafletPositionTransform = carElement.style.transform;

			const match = leafletPositionTransform.match(/translate3d\([^)]+\)/);
			const baseTransform = match ? match[0] : '';

			carElement.style.transformOrigin = 'center center'; // Asegura que la rotación sea desde el centro
			
        	carElement.style.transform = `${baseTransform} rotate(${currentHeading + 0}deg)`;
		}
	}

	// Inicializar la posición y rotación del auto
	updateCarPosition();

	// ---- Lógica de movimiento del auto ----

	// Manejadores de eventos para el teclado (PC)
	document.addEventListener('keydown', (event) => {
		console.log("Tecla presionada: ", event.key);

		switch (event.key) {
			case 'ArrowUp': // Flecha arriba
			case 'w':
				moveCar(1) // Movr hacia adelante
				break;
			case 'ArrowDown': // Flecha abajo
	        case 's':
	            moveCar(-1); // Mover hacia atrás
	            break;
	        case 'ArrowLeft': // Flecha izquierda
	        case 'a':
	            turnCar(-1); // Girar a la izquierda
	            break;
	        case 'ArrowRight': // Flecha derecha
	        case 'd':
	            turnCar(1); // Girar a la derecha
	            break;

		}
	});


	// Esta es nuestra "cajita" para guardar los repetidores
	let repetidores = {};

	function loopTactilDesplazarRotar(direccionBoton, accion) {
		// "direccionBoton" será como "arriba", "abajo", "izquierda", "derecha"
		// "accion" será "start" (tocar) o "end" (soltar)

		if (accion == "start") {
			console.log("Acción táctil en ejecución para: " + direccionBoton);

			// Si ya tenemos un repetidor para este botón, lo paramos primero para empezar uno nuevo
			if (repetidores[direccionBoton]) {
				clearInterval(repetidores[direccionBoton]);
			}

			// ¡Aquí creamos el repetidor!
			// Le decimos: "Cada 100 milisegundos (un poquito), haz esto:"
			repetidores[direccionBoton] = setInterval(() => {
				if (direccionBoton == "up") {
					moveCar(1); // Mueve el auto hacia adelante
				} else if (direccionBoton == "down") {
					moveCar(-1); // Mueve el auto hacia atrás
				} else if (direccionBoton == "left") {
					turnCar(-1); // Gira el auto a la izquierda
				} else if (direccionBoton == "right") {
					turnCar(1); // Gira el auto a la derecha
				}
			}, 100); // Esto es cada cuánto repite (100 = un poquito rápido)

		} else if (accion == "end") {
			console.log("Acción táctil terminó para: " + direccionBoton);

			// ¡Aquí paramos el repetidor!
			if (repetidores[direccionBoton]) {
				clearInterval(repetidores[direccionBoton]); // Le decimos al repetidor que pare
				delete repetidores[direccionBoton]; // Quitamos el repetidor de la cajita
			}
		}
	}

	// Manejadores de eventos para los botones en pantalla (Smartphones)
	document.getElementById('up').addEventListener('touchstart', (e) => { e.preventDefault(); loopTactilDesplazarRotar("up", "start"); });
	document.getElementById('down').addEventListener('touchstart', (e) => { e.preventDefault(); loopTactilDesplazarRotar("down", "start"); });
	document.getElementById('left').addEventListener('touchstart', (e) => { e.preventDefault(); loopTactilDesplazarRotar("left", "start"); });
	document.getElementById('right').addEventListener('touchstart', (e) => { e.preventDefault(); loopTactilDesplazarRotar("right", "start"); });

	document.getElementById('up').addEventListener('touchend', (e) => { e.preventDefault(); loopTactilDesplazarRotar("up", "end"); });
	document.getElementById('down').addEventListener('touchend', (e) => { e.preventDefault(); loopTactilDesplazarRotar("down", "end"); });
	document.getElementById('left').addEventListener('touchend', (e) => { e.preventDefault(); loopTactilDesplazarRotar("left", "end"); });
	document.getElementById('right').addEventListener('touchend', (e) => { e.preventDefault(); loopTactilDesplazarRotar("right", "end"); });

	// función para mover el auto
	function moveCar(direction) { // direction 1 para adelante, -1 para atrás
		const currentLatLng = carMarker.getLatLng();
		const headingRad = currentHeading * (Math.PI / 180); // Convertir grados a radianes directamente

		const deltaLat = direction * moveSpeed * Math.cos(headingRad);
		// Calcula el cambio de longitud (Este/Oeste) usando sin
		const deltaLng = direction * moveSpeed * Math.sin(headingRad);

		const newLat = currentLatLng.lat + deltaLat;
		const newLng = currentLatLng.lng + deltaLng;

		carMarker.setLatLng([newLat, newLng]);
		map.panTo([newLat, newLng], { animate: false }); // Central el mapa en el auto

        console.log("Moviendo auto a:", newLat, newLng, "Heading:", currentHeading);

        updateCarPosition();
	}

	// Función para girar el auto
	function turnCar(direction) { // direction: 1 para derecha, -1 para izquierda
		currentHeading += direction * turnSpeed;
		currentHeading = (currentHeading % 360 + 360) % 360; // Normaliza el ángulo entre 0 y 359,99
		updateCarPosition(); // Actualizar la rotación del auto
        console.log("Girando auto a:", currentHeading, "grados");

	}

	// Asegurarse de que el mapa se redimensione correctamente en pantallas móviles
	window.addEventListener('resize', () => {
		map.invalidateSize();
	});
	

	// --- Lógica del buscador de ubicación ---
    const locationSearchInput = document.getElementById('locationSearch');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', () => {
        const locationName = locationSearchInput.value;
        if (locationName) {
            searchLocation(locationName);
        }
    });

    async function searchLocation(query) {
        try {
            // Usamos Nominatim de OpenStreetMap para geocodificación
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.length > 0) {
                const firstResult = data[0];
                const newLat = parseFloat(firstResult.lat);
                const newLng = parseFloat(firstResult.lon);

                // Centrar el mapa en la nueva ubicación
                map.setView([newLat, newLng], initialZoom);

                // Mover el marcador del auto a la nueva ubicación
                carMarker.setLatLng([newLat, newLng]);
                updateCarPosition(); // Asegura que la posición del ícono se actualice

                console.log(`Ubicación encontrada: ${firstResult.display_name} en Lat: ${newLat}, Lng: ${newLng}`);
            } else {
                alert('No se encontraron resultados para la ubicación.');
                console.warn('No se encontraron resultados para la ubicación:', query);
            }
        } catch (error) {
            console.error('Error al buscar la ubicación:', error);
            alert('Ocurrió un error al buscar la ubicación. Inténtalo de nuevo.');
        }
    }
};