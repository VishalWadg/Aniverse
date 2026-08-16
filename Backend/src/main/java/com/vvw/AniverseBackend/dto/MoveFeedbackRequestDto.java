package com.vvw.AniverseBackend.dto;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;


public record MoveFeedbackRequestDto (
    UUID targetGroupId,
    @NotNull(message = "createNewGroup must be specified (true or false)")
    Boolean createNewGroup
){}
