package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.Role;
import org.apache.ibatis.annotations.*;

@Mapper
public interface RoleMapper extends BaseMapper<Role> {

    @Select("SELECT * FROM role WHERE name = #{name}")
    Role selectByName(String name);

    @Delete("DELETE FROM role WHERE name = #{name}")
    int deleteByName(String name);

    @Update("UPDATE role SET description = #{description}, functions = #{functions} WHERE name = #{name}")
    int updateByName(Role role);
}