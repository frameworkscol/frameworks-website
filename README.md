# Frame Works · sitio web

Sitio estático de una sola página: HTML, CSS y JavaScript sin dependencias ni build.
Sigue el manual de identidad en `../identidad-visual/manual-de-marca.html`.

```
web/
├── index.html        Contenido y estructura
├── css/styles.css    Estilos (tokens del manual al inicio del archivo)
├── js/main.js        Interacciones
└── assets/
    ├── favicon.svg
    └── img/          Fotografías (ver lista abajo)
```

## Verlo en local

Abre una terminal en esta carpeta y ejecuta:

```bash
python3 -m http.server 4321
```

Luego visita http://localhost:4321

## Pendiente antes de publicar

### 1. Fotografías
Las 13 fotos están guardadas en `assets/img/` (fotos gratuitas de Unsplash, licencia libre para uso comercial).
Para cambiar una, reemplaza el archivo manteniendo el mismo nombre, o cambia la ruta en `index.html` y actualiza su texto `alt`.

| Archivo | Sección |
|---|---|
| hero.jpg | Inicio |
| metodo-1-diagnostico.jpg … metodo-4-acompanamiento.jpg | Método |
| caso-panaderia.jpg, caso-distribuidora.jpg, caso-clinica.jpg, caso-tienda-en-linea.jpg | Casos |
| para-quien-empresas.jpg, para-quien-emprendedores.jpg | Para quién |
| nosotros-banda.jpg | Nosotros (banda grande) |
| nosotros-equipo.jpg | Nosotros (foto del equipo) |

### 2. Formulario de contacto
Conectado a **FormSubmit** (gratis, sin cuenta): cada mensaje llega a `frameworkscol@gmail.com`.
La primera vez que alguien envíe el formulario, FormSubmit manda a ese correo un mensaje de **activación**;
hay que abrirlo y confirmar. Desde ese momento los mensajes llegan solos.
Si el envío fallara, el formulario ofrece escribir directamente a `frameworkscol@gmail.com`.

### Espacios listos (ocultos hasta tener contenido real)
En `index.html` hay tres bloques con el atributo `hidden`. Para activarlos, quita `hidden` y completa:
- **Logos de clientes** (`<!-- CLIENTES -->`): guarda los logos en `assets/img/clientes/` y añade un `<li><img ...></li>` por cliente.
- **Cifras** (`<!-- CIFRAS -->`): escribe los valores reales en `data-count` (por ejemplo `data-count="25"`). Cuentan hacia arriba al aparecer.
- **Sello de alianza** (`<!-- SELLO DE ALIANZA -->`, en el inicio): descomenta la imagen y apunta a tu sello (Meta Business Partner, Google, etc.).
No publiques cifras, logos ni sellos que no sean reales.

### Idiomas (inglés por defecto, español opcional)
- El texto del HTML está escrito en **español**. Al cargar, `js/i18n.js` lo cambia al **inglés** usando el diccionario `js/i18n-en.js`.
- El botón **EN / ES** del encabezado cambia el idioma y el navegador recuerda la elección. También funciona `?lang=es` en la dirección.
- **Si cambias o agregas un texto en español**, agrega su traducción en `js/i18n-en.js` con el texto español exacto como clave; si no, ese texto se verá en español también en la versión en inglés.

### 3. Datos por confirmar
- Correo de contacto: `frameworkscol@gmail.com`. El dominio todavía no está definido.
- Mensaje de confirmación del formulario: "Te respondemos en menos de un día hábil" (`js/main.js`).
- Duración de la primera llamada (30 minutos) en la sección de contacto.
- Servicios, casos y preguntas frecuentes: redactados a partir del posicionamiento; ajústalos a la oferta real.
  Los casos son situaciones tipo, sin cifras inventadas. Cuando tengas clientes reales, sustitúyelos.

### 4. Legal
Los enlaces de Aviso legal, Privacidad y Cookies apuntan a `#`. Hacen falta esas páginas antes de publicar,
sobre todo si se recogen datos en el formulario o se añade analítica.

### 5. Imagen para compartir
Añade `assets/og.jpg` (1200 × 630) y la etiqueta `<meta property="og:image" content="https://TU-DOMINIO/assets/og.jpg">`.

## Publicar
Cualquier alojamiento estático sirve: Netlify (arrastrar la carpeta `web`), Vercel, Cloudflare Pages o GitHub Pages.

## Demo del computador (inicio)
- Fotos de los clientes del CRM (`assets/img/demo-*.jpg`): Unsplash, licencia gratuita.
- Brochure de marketing (`assets/img/ads/`): marcas ficticias. NOIR = imagen creada con IA (FLUX.1 schnell, licencia Apache 2.0); VOLT y AURA = fotos de Unsplash (licencia gratuita). Animados con CSS.
- Escena de desarrollo web: estudio ficticio ARCA, fotos de Unsplash en `assets/img/arca/`.
- Para usar videos propios (por ejemplo, de Higgsfield), ver `../identidad-visual/prompts-videos-higgsfield.md`.
