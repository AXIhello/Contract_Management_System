package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.User;
import org.apache.ibatis.annotations.Select;
import org.springframework.data.repository.query.Param;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    @Select("SELECT * FROM users WHERE user_id = #{user_id}")
    User selectById(@Param("user_id") int id);

    @Select("SELECT id FROM users WHERE username = #{username}")
    Integer getUserIdByUsername(String username);
    
    @Select("SELECT id FROM users WHERE id = (SELECT user_id FROM user_session WHERE session_id = #{sessionId})")
    Integer getCurrentUserId();
}
