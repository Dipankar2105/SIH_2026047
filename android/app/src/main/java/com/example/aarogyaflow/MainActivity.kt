package com.example.aarogyaflow

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.aarogyaflow.data.remote.ApiService
import com.example.aarogyaflow.theme.AarogyaFlowTheme
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
  @Inject lateinit var apiService: ApiService

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      AarogyaFlowTheme {
        // Root surface container using Stitch background color
        Surface(modifier = Modifier.fillMaxSize(), color = androidx.compose.ui.graphics.Color(0xFFF2F6F9)) {
          MainNavigation(apiService)
        }
      }
    }
  }
}
