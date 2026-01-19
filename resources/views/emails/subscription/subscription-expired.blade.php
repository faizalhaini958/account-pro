@extends('emails.layout')

@section('content')
<h1>Your Subscription Has Expired</h1>

<p>Hello {{ $user->name }},</p>

<p>Your <strong>{{ $plan->name }}</strong> subscription has expired as of {{ $subscription->ends_at->format('F j, Y') }}.</p>

<div class="info-box">
    <p style="margin-bottom: 0;"><strong>Your account is now in read-only mode.</strong></p>
    <p style="margin-bottom: 0; margin-top: 8px;">You can still view your data, but you won't be able to create or edit records until you reactivate your subscription.</p>
</div>

<p><strong>To continue using BukuKira:</strong></p>
<ol style="padding-left: 20px; margin: 16px 0;">
    <li style="margin-bottom: 8px;">Choose a subscription plan</li>
    <li style="margin-bottom: 8px;">Complete the payment</li>
    <li style="margin-bottom: 8px;">Resume where you left off immediately</li>
</ol>

<a href="{{ route('profile.edit') }}#subscription" class="button">Reactivate Subscription</a>

<p><strong>Don't worry - your data is safe!</strong></p>
<p class="text-muted">All your companies, invoices, customers, and financial records are securely stored and will be immediately accessible when you reactivate.</p>

<p>Questions? We're here to help at support@bukukira.com</p>
@endsection
