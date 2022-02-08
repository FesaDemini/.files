if status is-interactive
    # Commands to run in interactive sessions can go here
end

function fish_greeting
    fortune
end

funcsave fish_greeting

export EDITOR=nvim
