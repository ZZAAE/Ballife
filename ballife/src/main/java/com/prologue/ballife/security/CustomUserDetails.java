package com.prologue.ballife.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.prologue.ballife.domain.user.User;

import lombok.Getter;

@Getter
public class CustomUserDetails implements UserDetails{
    private final Long userId;
    private final String username;
    private final String password;
    private final String roleAuthority;

    public CustomUserDetails(User user){
        this.userId = user.getUserId();
        this.username = user.getLoginId(); //로그인아이디가 들어감
        this.password = user.getPasswordHash();
        User.UserCategory role = user.getUserCategory() != null ? user.getUserCategory() : User.UserCategory.USER;
        this.roleAuthority = "ROLE_" + role.name();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities(){
        return List.of(new SimpleGrantedAuthority(roleAuthority));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
