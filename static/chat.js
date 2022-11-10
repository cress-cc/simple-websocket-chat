'use strict';

const socket = io();

$(document).ready(() => {

    socket.on('count_update', msg => {
        $('#user_count').text(msg.user_count);

        $('#login_users').empty();
        $.each(msg.login_users, (index, login_user) => {
            $('#login_users').append('<li>' + login_user + '</li>');
        });
    });

    socket.on('init_update', msg => {
        $('#messages').empty();
        $.each(msg.messages, (index, m) => {
            var timestamp = new Date(m.timestamp * 1000);
            $('#messages').prepend('<li>' + m.from + ' : ' + m.message
                    + '<span class="timestamp">' + timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString() + '</span>' + '</li>');
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
        $('#messages').prepend('<li>' + msg.from + ' : ' + msg.message
                + '<span class="timestamp">' + timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString() + '</span>' + '</li>');
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
