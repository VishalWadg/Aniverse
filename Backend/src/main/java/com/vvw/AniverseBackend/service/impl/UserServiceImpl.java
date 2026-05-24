package com.vvw.AniverseBackend.service.impl;


import com.vvw.AniverseBackend.dto.CurrentUserProfileDto;
import com.vvw.AniverseBackend.dto.PublicUserProfileDto;
import com.vvw.AniverseBackend.dto.UpdateUserProfileDto;
import com.vvw.AniverseBackend.dto.UserResponseDto;
import com.vvw.AniverseBackend.entity.User;
import com.vvw.AniverseBackend.exceptions.DuplicateResourceException;
import com.vvw.AniverseBackend.exceptions.EntityNotFoundException;
import com.vvw.AniverseBackend.exceptions.InvalidOperationException;
import com.vvw.AniverseBackend.mapper.UserMapper;
import com.vvw.AniverseBackend.repository.PostRepository;
import com.vvw.AniverseBackend.repository.UserRepository;
import com.vvw.AniverseBackend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final UserMapper userMapper;
    private User findExistingUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with username: " + username));
    }

    private long getPostCount(String username) {
        return postRepository.countByAuthorUsernameAndIsDeletedFalse(username);
    }

    private PublicUserProfileDto toPublicUserProfileDto(User user) {
        return userMapper.toPublicUserProfileDto(user, 0);
    }

    private CurrentUserProfileDto toCurrentUserProfileDto(User user) {
        return userMapper.toCurrentUserProfileDto(user, getPostCount(user.getUsername()));
    }

    private String normalizeNullableText(String value) {
        if (value == null) {
            return null;
        }

        String trimmedValue = value.trim();
        return trimmedValue.isEmpty() ? null : trimmedValue;
    }

    private String normalizeEmail(String value) {
        if (value == null) {
            return null;
        }

        return value.trim().toLowerCase(Locale.ROOT);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(user -> userMapper.toUserResponseDto(user));
    }

    @Override
    @Transactional(readOnly = true)
    public PublicUserProfileDto getUserProfile(String username) {
        return toPublicUserProfileDto(findExistingUserByUsername(username));
    }

    @Override
    @Transactional(readOnly = true)
    public CurrentUserProfileDto getCurrentUserProfile(String username) {
        return toCurrentUserProfileDto(findExistingUserByUsername(username));
    }

    @Override
    @Transactional
    public CurrentUserProfileDto updateCurrentUserProfile(String username, UpdateUserProfileDto updateUserProfileDto) {
        User user = findExistingUserByUsername(username);

        if (updateUserProfileDto.getName() != null) {
            String normalizedName = updateUserProfileDto.getName().trim();
            if (normalizedName.isEmpty()) {
                throw new InvalidOperationException("Name cannot be blank");
            }
            user.setName(normalizedName);
        }

        if (updateUserProfileDto.getEmail() != null) {
            String normalizedEmail = normalizeEmail(updateUserProfileDto.getEmail());
            if (userRepository.existsByEmailAndIdNot(normalizedEmail, user.getId())) {
                throw new DuplicateResourceException("Email is already in use");
            }
            user.setEmail(normalizedEmail);
        }

        if (updateUserProfileDto.getBio() != null) {
            user.setBio(normalizeNullableText(updateUserProfileDto.getBio()));
        }

        if (updateUserProfileDto.getProfilePic() != null) {
            user.setProfilePic(normalizeNullableText(updateUserProfileDto.getProfilePic()));
        }

        return toCurrentUserProfileDto(userRepository.save(user));
    }
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    @Override
    public User findByUsername(String username){
        return findExistingUserByUsername(username);
    }
}
