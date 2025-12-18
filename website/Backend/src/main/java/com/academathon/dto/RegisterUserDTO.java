package com.academathon.dto;

import com.academathon.model.User.Role;

public class RegisterUserDTO {

    private String email;
    private String password;
    private String username;
    private Role role;

    public CharSequence getPassword() {
        return password;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole(){
        return role;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
