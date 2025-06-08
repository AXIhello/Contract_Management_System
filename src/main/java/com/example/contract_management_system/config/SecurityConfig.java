package com.example.contract_management_system.config;

import com.example.contract_management_system.service.impl.MyUserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;


@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final MyUserDetailsServiceImpl myUserDetailsService;
    private final MyAccessDeniedHandler myAccessDeniedHandler;

    public SecurityConfig(MyUserDetailsServiceImpl myUserDetailsService,
                          MyAccessDeniedHandler myAccessDeniedHandler) {
        this.myUserDetailsService = myUserDetailsService;
        this.myAccessDeniedHandler = myAccessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 认证管理器，供controller调用
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // 认证提供者，指定UserDetailsService和密码编码器
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(myUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        // 放行静态页面（login.html、register.html）GET请求
                        .requestMatchers(HttpMethod.GET, "/userManagement/login.html","/userManagement/register.html").permitAll()
                        // 放行静态资源，如 CSS、JS、图片等
                        .requestMatchers(HttpMethod.GET, "/style.css","/userManagement/script.js").permitAll()
                        // 放行登录注册接口的POST请求
                        .requestMatchers(HttpMethod.POST, "/api/user/login", "/api/user/register", "/api/user/logout").permitAll()
                        // 其他请求必须认证
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider())
                .sessionManagement(session -> session.maximumSessions(1))

                // 开启记住我功能
                .rememberMe(rememberMe -> rememberMe
                .userDetailsService(myUserDetailsService)
                .tokenValiditySeconds(7 * 24 * 60 * 60) // 一周有效期
                // 可选：设置加密的key，默认会生成随机key，每次重启失效
                .key("uniqueAndSecret")
                )
                // ✅ 加上这一段实现登出接口
                .logout(logout -> logout
                        // 默认登出路径是 /logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/userManagement/login.html")  // 登出成功后跳转登录页
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                )
                // ✅ 注册自定义 AccessDeniedHandler
                .exceptionHandling(exception -> exception
                        .accessDeniedHandler(myAccessDeniedHandler)
                );
        return http.build();
    }

}
