# Sistema de Gestión de Invitados - Cumpleaños

Sistema web para gestionar invitados, confirmaciones y costos de una fiesta de cumpleaños.

## Características

- ✅ Gestión de invitados/familias con cantidad de adultos, niños y bebés
- ✅ Configuración de precios (comidas, alquiler, mesa dulces)
- ✅ Sistema de estados: Invitados, Confirmados, Declinados
- ✅ Cálculo automático de costos por estado
- ✅ Sistema de spots: cuando alguien declina, se liberan spots disponibles
- ✅ Reasignación de spots (reinvitar o añadir nuevos invitados)
- ✅ Vista de resumen con costos totales
- ✅ **Sincronización en la nube** - Acceso compartido sin base de datos
- ✅ Sincronización al cargar la página y después de cada cambio
- ✅ Persistencia local + en la nube

## Instalación

```bash
npm install
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_JSONBIN_API_KEY=tu_api_key_aqui
VITE_JSONBIN_BIN_ID=tu_bin_id_aqui
```

**Para obtener las credenciales:**
1. Crea una cuenta gratuita en [jsonbin.io](https://jsonbin.io)
2. Obtén tu API Key desde el panel de control
3. Crea un Bin (o usa uno existente) y copia su ID
4. Añade ambas variables al archivo `.env`

**Importante:** Ambos usuarios deben usar el mismo `VITE_JSONBIN_BIN_ID` para compartir los datos.

## Desarrollo

```bash
npm run dev
```

## Construcción

```bash
npm run build
```

## Uso

### Configuración Inicial de Sincronización

Para que tú y tu pareja puedan acceder a los mismos datos:

1. **Crea una cuenta en [jsonbin.io](https://jsonbin.io)** (gratis)
2. **Obtén tu API Key** desde el panel de control de JSONBin.io
3. **Crea un Bin** (o usa uno existente) y copia su ID
4. **Crea un archivo `.env`** en la raíz del proyecto (copia `.env.example`):
   ```bash
   cp .env.example .env
   ```
5. **Edita el archivo `.env`** y añade tus credenciales:
   ```
   VITE_JSONBIN_API_KEY=tu_api_key_aqui
   VITE_JSONBIN_BIN_ID=tu_bin_id_aqui
   ```
6. **Reinicia el servidor de desarrollo** (`npm run dev`)

**Importante:** Ambos deben usar el mismo Bin ID para compartir los datos. Comparte el Bin ID con tu pareja para que lo añada a su archivo `.env`.

### Uso Diario

1. **Configurar Precios**: Ve a la pestaña "Precios" y configura los precios de comidas, alquiler, etc.
2. **Añadir Invitados**: En la pestaña "Invitados", añade las familias/grupos con sus cantidades.
3. **Confirmar Invitados**: Desde la lista de "Invitados", puedes confirmar o declinar invitados.
4. **Ver Resumen**: En la pestaña "Resumen" verás los costos totales de invitados y confirmados.
5. **Gestionar Spots**: Si alguien declina, verás los spots disponibles y podrás reinvitar o añadir nuevos invitados.
6. **Sincronizar**: Los datos se sincronizan automáticamente al cargar la página y después de cada cambio (crear, editar, eliminar invitados o precios). También puedes sincronizar manualmente desde la pestaña "🔄 Sincronizar".

### Almacenamiento

- **Local**: Los datos se guardan en el navegador (localStorage) para acceso rápido
- **Nube**: Los datos se sincronizan automáticamente con JSONBin.io para acceso compartido
- Si no configuras la sincronización, el sistema funciona solo con almacenamiento local
