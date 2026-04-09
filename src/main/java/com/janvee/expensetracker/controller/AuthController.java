package com.janvee.expensetracker.controller;

import com.janvee.expensetracker.entity.User;
import com.janvee.expensetracker.repository.UserRepository;
import com.janvee.expensetracker.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ SIGNUP
    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        userRepo.save(user);
        return "User registered";
    }

    // ✅ LOGIN
    @PostMapping("/login")
    public String login(@RequestBody User user) {

        Optional<User> existingUser = userRepo.findByEmail(user.getEmail());

        if (existingUser.isPresent() &&
                existingUser.get().getPassword().equals(user.getPassword())) {

            return jwtUtil.generateToken(user.getEmail());
        }

        throw new RuntimeException("Invalid credentials");
    }
}