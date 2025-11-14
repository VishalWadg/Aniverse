package com.vvw.AniverseBackend.key;

import java.io.Serializable;
import java.util.Objects;

// import com.vvw.AniverseBackend.entity.Post;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PostTagId implements Serializable{
    private Long post;
    private Long tag;

    @Override
    public boolean equals(Object o){
        if(this == o) return true;

        if(o == null || getClass() != o.getClass()) return false;

        PostTagId postTagId = (PostTagId) o;

        return Objects.equals(post, postTagId.post) &&
               Objects.equals(tag, postTagId.tag);
    }

    @Override
    public int hashCode(){
        return Objects.hash(post, tag);
    }

}
