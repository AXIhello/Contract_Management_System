package com.example.contract_management_system.dto;

public class Result<T> {
    private int code;      // 200表示成功，非200表示失败
    private String msg;
    private T data;

    public Result(int i, String msg, T data) {
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "成功", data);
    }

    public static <T> Result<T> error(String msg) {
        return new Result<>(500, msg, null);
    }

    // 构造、getter、setter省略
}
