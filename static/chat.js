'use strict';

const socket = io();

$(document).ready(() => {

    socket.on('count_update', msg => {
        $('#user_count').text(msg.user_count);

        $('#login_users').empty();
        $.each(msg.login_users, (index, login_user) => {
            $('#login_users').append($('<li/>').text(login_user));
        });
    });

    socket.on('init_update', msg => {
        $('#messages').empty();
        $.each(msg.messages, (index, m) => {
            var timestamp = new Date(m.timestamp * 1000);
            var $ts = $('<span class="timestamp"/>').text(timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString());
            var $li = $('<li/>').text(m.from + ' : ' + m.message).append($ts);
            $('#messages').prepend($li);
        });
    });

    socket.on('login_update', msg => {
        if (msg.success != 1) return;
        $('#login_form').hide();
        $('#login_name').text(msg.user_name);
        $('#message_form').show();
    });

    socket.on('message_update', msg => {
        var timestamp = new Date(msg.timestamp * 1000);
        var $ts = $('<span class="timestamp"/>').text(timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString());
        var $li = $('<li/>').text(msg.from + ' : ' + msg.message).append($ts);
        $('#messages').prepend($li);
    });

    socket.on('logout', msg => {
        $('#message_form').hide();
        $('#login_form').show();
    });

    $('#login_form').submit(() => {
        var user_name = $('#login_form [name=user_name]').val();
        if (!user_name) return false;
        $('#login_form [name=user_name]').val('');

        socket.emit('login_request', {user_name: user_name});
        return false;
    });

    $('#message_form').submit(() => {
        var message = $('#message_form [name=message]').val();
        if (!message) return false;
        $('#message_form [name=message]').val('');

        socket.emit('message_request', {message: message});
        return false;
    });

    $('#logout_button').click(() => {
        socket.emit('logout_request', {});
        return false;
    });

});
