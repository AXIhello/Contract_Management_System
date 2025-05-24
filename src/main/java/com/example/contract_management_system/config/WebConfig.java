//package com.example.contract_management_system.config;
//
//import com.example.contract_management_system.interceptor.LoginInterceptor;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//
//@Configuration
//public class WebConfig implements WebMvcConfigurer {
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(new LoginInterceptor())
//                .addPathPatterns("/api/**") // 拦截所有请求
//                .excludePathPatterns(
//                        "/api/user/login",
//                        "/api/user/register",
//                        "/**/*.js",
//                        "/**/*.css",
//                        "/**/*.png",
//                        "/**/*.jpg",
//                        "/**/*.jpeg",
//                        "/**/*.gif",
//                        "/**/*.html",
//                        "/favicon.ico"
//                );
//        // 排除登录、注册接口和静态资源路径
//    }
//}
//
