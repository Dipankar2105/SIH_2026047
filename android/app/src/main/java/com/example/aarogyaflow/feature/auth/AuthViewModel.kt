package com.example.aarogyaflow.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aarogyaflow.data.remote.ApiService
import com.example.aarogyaflow.data.remote.models.MobileOtpRequest
import com.example.aarogyaflow.data.remote.models.MobileOtpVerify
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Success(val message: String = "") : AuthState()
    data class Error(val message: String) : AuthState()
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val apiService: ApiService
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()

    var txnId: String? = null
        private set

    fun requestOtp(mobileOrAbha: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                // Assuming mobileOrAbha is treated as mobile for now based on API_CONTRACT
                val response = apiService.requestMobileOtp(MobileOtpRequest(mobile = mobileOrAbha))
                if (response.isSuccessful && response.body() != null) {
                    txnId = response.body()?.txnId
                    _authState.value = AuthState.Success("OTP Sent")
                } else {
                    _authState.value = AuthState.Error("Failed to send OTP: ${response.code()}")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Network error")
            }
        }
    }

    fun verifyOtp(otp: String) {
        val currentTxnId = txnId
        if (currentTxnId == null) {
            _authState.value = AuthState.Error("Transaction ID missing. Request OTP first.")
            return
        }

        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = apiService.verifyMobileOtp(MobileOtpVerify(txn_id = currentTxnId, otp = otp))
                if (response.isSuccessful && response.body() != null) {
                    _authState.value = AuthState.Success("OTP Verified successfully")
                } else {
                    _authState.value = AuthState.Error("Invalid OTP: ${response.code()}")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Network error")
            }
        }
    }

    fun resetState() {
        _authState.value = AuthState.Idle
    }
}
