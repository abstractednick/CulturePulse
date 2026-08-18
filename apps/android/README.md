# Android — CulturePulse

Kotlin + Jetpack Compose client for the same product as the web map.

## Open in Android Studio

1. **File → Open** → `apps/android`
2. Copy `local.properties.example` to `local.properties` and set `sdk.dir`
3. Sync Gradle (Studio will download the wrapper if needed)
4. Run on an emulator API 26+

The first launch uses **in-app demo pulses** (Ahmedabad Night Skaters, study circles, open mic, …) so the UI is reviewable without the API.

## Live API

`BuildConfig.API_URL` defaults to `http://10.0.2.2:4000` (emulator → host machine). Start `npm run dev` at the repo root, then swap `PulseRepository` to call `ApiModule.api()`.

## Permissions

Fine/coarse location are declared for the production Maps SDK path. The stylized Compose map in this portfolio build does not require a Google Maps key — that's intentional so a recruiter can compile without billing.

## Package

`com.culturepulse.app` — map home, pulse detail, host flow, scene list, ViewModel, Retrofit module.
