package com.example.contract_management_system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.contract_management_system.pojo.Right;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface RightMapper extends BaseMapper<Right> {
    @Select("SELECT roleName FROM  `right`  WHERE user_id = #{userId}")
    List<String> selectRoleNameByUserId(Integer userId);

    @Insert("INSERT INTO `right` (user_id, roleName) " + "VALUES (#{userId}, #{roleName})")
    void assignRights(int userId, String roleName);

    @Select("SELECT user_id FROM `right` WHERE roleName = #{roleName}")
    List<Integer> selectUserWithRole(String roleName);

    @Delete("DELETE FROM `right` WHERE user_id = #{userId}")
    void deleteRolesById(int userId);
}
