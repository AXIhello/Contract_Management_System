package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {

}
