# English Tutor - Guía de Configuración e Instalación

> **App funcional de llamadas de voz con OpenAI Realtime API**

## 🚀 INICIO RÁPIDO

### Paso 1: Configurar API Key en Rork

**MUY IMPORTANTE - La app NO funcionará sin esto:**

1. Ve a [Rork.app](https://rork.app) → Tu proyecto
2. Click en **Integrations** → **Environment Variables**
3. Agrega esta variable:
   ```
   Nombre: EXPO_PUBLIC_OPENAI_API_KEY
   Valor: tu_api_key_de_openai
   ```
4. Guarda y reinicia la app

### Paso 2: Obtener API Key de OpenAI

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Navega a **API Keys**
3. Crea una nueva key
4. Cópiala y pégala en Rork (Paso 1)

### Paso 3: Abrir en tu iPhone

1. Descarga **Expo Go** o **Rork App** del App Store
2. Escanea el QR desde la terminal de Rork
3. ¡Listo! Ya puedes hablar con los tutores

## ✅ Verificación de Configuración

Cuando abras la app, deberías ver en los logs:

```
🔌 Connecting to OpenAI Realtime API...
🔑 Using API key: sk-proj-...
✅ WebSocket connected successfully
✅ Session created successfully
```

Si ves `❌ OpenAI API key is not configured`, revisa el Paso 1.

## 📱 Cómo Usar la App

### Primera vez:
1. Selecciona tutor (Maya o Miles)
2. Configura estilo y idioma
3. Presiona "Iniciar Llamada"
4. Habla cuando el tutor te salude

### Siguientes veces:
1. Presiona el tutor
2. Comienza a hablar inmediatamente

## 🎯 Características

- ✅ Llamadas de voz en tiempo real con AI
- ✅ Subtítulos en vivo (activables/desactivables)
- ✅ 3 estilos de enseñanza (Estricto, Amigable, Coach)
- ✅ 3 modos de idioma (Inglés, Español, Mixto)
- ✅ Racha de días (como Duolingo)
- ✅ Contador de minutos mensuales
- ✅ Sonidos realistas de llamada
- ✅ Sistema de calificación

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
bun install

# Iniciar servidor
bun run start

# Escanear QR con tu teléfono
```

## 🐛 Solución de Problemas

### "No escucho al tutor"
1. Verifica que el volumen esté alto
2. Usa un dispositivo real (no simulador)
3. Revisa que la API key esté configurada
4. Verifica los logs en la consola

### "WebSocket error"
1. Verifica la API key en Rork
2. Checa tu saldo en OpenAI
3. Reinicia la app

### "No pide permisos de micrófono"
- Los permisos se solicitan automáticamente
- Si no aparecen, verifica Ajustes del iPhone

## 📂 Archivos Importantes

```
hooks/useRealtimeCall.ts       # Conexión con OpenAI
providers/AppStateProvider.tsx # Estado de la app
app/call.tsx                   # Pantalla de llamada
constants/tutors.ts            # Configuración de tutores
```

## 🔐 Seguridad

- ✅ Sin API keys en el código
- ✅ Variables de entorno en Rork
- ✅ `.gitignore` configurado correctamente
- ❌ NUNCA hagas commit de `.env` o `env`

## 📝 Logs Útiles para Debugging

```
🔌 = WebSocket
🎤 = Micrófono
🎵 = Audio del tutor
📩 = Eventos de la API
✅ = Éxito
❌ = Error
```

## 🚢 Deploy a TestFlight

```bash
# Instalar EAS
bun i -g @expo/eas-cli

# Build
eas build --platform ios

# Submit
eas submit --platform ios
```

**IMPORTANTE**: Configura secrets con `eas secret:create` antes de hacer build.

## ❓ Preguntas Frecuentes

**P: ¿Por qué no funciona en el navegador web?**  
R: La Realtime API funciona mejor en dispositivos nativos. Usa Expo Go en tu iPhone.

**P: ¿Cuánto cuesta usar OpenAI Realtime API?**  
R: Consulta [openai.com/pricing](https://openai.com/pricing) para costos actuales.

**P: ¿Puedo cambiar la voz del tutor?**  
R: Sí, en `hooks/useRealtimeCall.ts` cambia `voice: "alloy"` por otra voz de OpenAI.

**P: ¿Funciona sin internet?**  
R: No, requiere conexión para comunicarse con OpenAI.

---

**Built with ❤️ by Rork + OpenAI**
