package com.culturepulse.app.data.remote

import com.culturepulse.app.BuildConfig
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

/**
 * Retrofit surface for the CulturePulse API. The Compose UI currently
 * hydrates from [com.culturepulse.app.data.repository.DemoPulses] so
 * a recruiter can run the app without the backend; point this at
 * BuildConfig.API_URL (10.0.2.2:4000 on the emulator) when you want live data.
 */
interface CulturePulseApi {
    @GET("pulses")
    suspend fun pulses(
        @Query("lat") lat: Double = 23.0225,
        @Query("lng") lng: Double = 72.5714,
        @Query("radiusKm") radiusKm: Int = 12,
    ): Map<String, Any>
}

object ApiModule {
    fun api(): CulturePulseApi {
        val client = OkHttpClient.Builder()
            .connectTimeout(8, TimeUnit.SECONDS)
            .addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
            .build()
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_URL.trimEnd('/') + "/")
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
            .create(CulturePulseApi::class.java)
    }
}
