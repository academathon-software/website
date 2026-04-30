package com.academathon.dto;

import com.academathon.model.User.Role;

public class RegisterUserDTO {

    private String email;
    private String password;
    private String username;
    private Role role;
    private String pronouns;
    private String studentGrade;

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

    public String getPronouns() {
        return pronouns;
    }

    public String getStudentGrade() {
        return studentGrade;
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

    public void setPronouns(String pronouns) {
        this.pronouns = pronouns;
    }

    public void setStudentGrade(String studentGrade) {
        this.studentGrade = studentGrade;
    }
}
