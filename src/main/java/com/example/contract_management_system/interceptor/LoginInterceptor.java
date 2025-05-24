//package com.example.contract_management_system.interceptor;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import jakarta.servlet.http.HttpSession;
//import org.springframework.web.servlet.HandlerInterceptor;
//
//// 目前会放行任何请求
//public class LoginInterceptor implements HandlerInterceptor {
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//        HttpSession session = request.getSession(false); // 获取已有Session，避免创建新Session
//        if (session != null && session.getAttribute("currentUser") != null) {
//            // 用户已登录，放行请求
//            return true;
//        }
//        // 用户未登录，拒绝访问，响应401或重定向到登录页
//        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
//        response.getWriter().write("Please login first！");
//        return false;
//
//    }
//}