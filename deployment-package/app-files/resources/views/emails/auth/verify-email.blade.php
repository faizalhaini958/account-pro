@extends('emails.layout')

@section('content')
<h1>Verify Your Email Address</h1>

<p>Hello {{ $user->name }},</p>

<p>Thank you for registering with BukuKira! Please verify your email address by clicking the button below:</p>

<a href="{{ $verificationUrl }}" class="button">Verify Email Address</a>

<p class="text-muted">This verification link will expire in 60 minutes.</p>

<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Why verify your email?</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">Email verification helps us ensure the security of your account and enables you to receive important notifications about your subscription and invoices.</p>
</div>

<p>If you did not create an account, no further action is required.</p>

<p class="text-muted" style="margin-top: 32px;">
    If you're having trouble clicking the button, copy and paste the URL below into your web browser:<br>
    <span style="word-break: break-all;">{{ $verificationUrl }}</span>
</p>
@endsection
