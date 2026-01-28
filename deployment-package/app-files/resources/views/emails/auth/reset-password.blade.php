@extends('emails.layout')

@section('content')
<h1>Reset Your Password</h1>

<p>Hello,</p>

<p>You are receiving this email because we received a password reset request for your account.</p>

<a href="{{ $resetUrl }}" class="button">Reset Password</a>

<p class="text-muted">This password reset link will expire in 60 minutes.</p>

<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Security Tip:</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
</div>

<p class="text-muted" style="margin-top: 32px;">
    If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
    <span style="word-break: break-all;">{{ $resetUrl }}</span>
</p>
@endsection
