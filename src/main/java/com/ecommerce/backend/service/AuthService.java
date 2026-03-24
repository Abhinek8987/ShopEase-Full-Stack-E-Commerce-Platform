package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entity.Cart;
import com.ecommerce.backend.entity.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.BadRequestException;
import com.ecommerce.backend.repository.CartRepository;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new BadRequestException("Email already registered"));
            if (existing.isVerified()) throw new BadRequestException("Email already registered");
            String otp = generateOtp();
            existing.setOtp(otp);
            existing.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(existing);
            emailService.sendOtpEmail(existing.getEmail(), existing.getUsername(), otp, "VERIFY");
            return;
        }
        String otp = generateOtp();
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .verified(false)
                .otp(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .build();
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp, "VERIFY");
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (user.isVerified()) throw new BadRequestException("Account already verified");
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp()))
            throw new BadRequestException("Invalid OTP");
        if (LocalDateTime.now().isAfter(user.getOtpExpiry()))
            throw new BadRequestException("OTP expired. Please request a new one.");
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        if (!cartRepository.findByUser(user).isPresent()) {
            cartRepository.save(Cart.builder().user(user).build());
        }
        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    @Transactional
    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (user.isVerified()) throw new BadRequestException("Account already verified");
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp, "VERIFY");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));
        if (!user.isVerified()) throw new BadRequestException("Please verify your email before logging in");
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        String token = jwtService.generateToken(user);
        return buildAuthResponse(token, user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with this email"));
        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        emailService.sendOtpEmail(user.getEmail(), user.getUsername(), otp, "RESET");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp()))
            throw new BadRequestException("Invalid OTP");
        if (LocalDateTime.now().isAfter(user.getOtpExpiry()))
            throw new BadRequestException("OTP expired. Please request a new one.");
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token).username(user.getUsername())
                .email(user.getEmail()).role(user.getRole().name())
                .build();
    }
}
