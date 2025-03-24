package com.boot.demo.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int roleId;

    @Column(unique = true, nullable = false)
    private String roleName;

    // ✅ Default Constructor
    public Role() {}

    // ✅ Parameterized Constructor
    public Role(String roleName) {
        this.roleName = roleName;
    }

    // ✅ Getters & Setters
    public int getRoleId() { return roleId; }
    public void setRoleId(int roleId) { this.roleId = roleId; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
}
