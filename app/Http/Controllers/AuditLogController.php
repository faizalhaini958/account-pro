<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Filter by event type
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }

        // Filter by auditable type (model)
        if ($request->filled('model')) {
            $query->where('auditable_type', $request->model);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        // Search in values
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereRaw("CAST(old_values AS CHAR) LIKE ?", ["%{$search}%"])
                  ->orWhereRaw("CAST(new_values AS CHAR) LIKE ?", ["%{$search}%"]);
            });
        }

        $logs = $query->paginate(50)->withQueryString();

        // Transform logs to include readable model names
        $logs->getCollection()->transform(function ($log) {
            $log->model_name = class_basename($log->auditable_type);
            $log->event_label = $this->getEventLabel($log->event);
            return $log;
        });

        // Get unique events for filter dropdown
        $events = AuditLog::distinct()
            ->pluck('event')
            ->map(fn ($event) => [
                'value' => $event,
                'label' => $this->getEventLabel($event),
            ]);

        // Get unique models for filter dropdown
        $models = AuditLog::distinct()
            ->pluck('auditable_type')
            ->map(fn ($type) => [
                'value' => $type,
                'label' => class_basename($type),
            ]);

        return Inertia::render('AuditLog/Index', [
            'logs' => $logs,
            'events' => $events,
            'models' => $models,
            'filters' => $request->only(['event', 'model', 'user_id', 'from_date', 'to_date', 'search']),
        ]);
    }

    public function show(AuditLog $auditLog)
    {
        $this->authorize('view', $auditLog);

        $auditLog->load('user:id,name,email');
        $auditLog->model_name = class_basename($auditLog->auditable_type);
        $auditLog->event_label = $this->getEventLabel($auditLog->event);

        return Inertia::render('AuditLog/Show', [
            'log' => $auditLog,
        ]);
    }

    /**
     * Export audit logs to Excel
     */
    public function export(Request $request)
    {
        $this->authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Apply same filters as index
        if ($request->filled('event')) {
            $query->where('event', $request->event);
        }
        if ($request->filled('model')) {
            $query->where('auditable_type', $request->model);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $logs = $query->limit(10000)->get();

        $filename = 'audit-logs-' . now()->format('Y-m-d-His') . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\AuditLogExport($logs),
            $filename
        );
    }

    /**
     * Get human-readable event labels
     */
    protected function getEventLabel(string $event): string
    {
        return match ($event) {
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'restored' => 'Restored',
            'role_changed' => 'Role Changed',
            'added_to_tenant' => 'Added to Tenant',
            'removed_from_tenant' => 'Removed from Tenant',
            'permissions_modified' => 'Permissions Modified',
            'permissions_synced' => 'Permissions Synced',
            'login' => 'Login',
            'logout' => 'Logout',
            'password_changed' => 'Password Changed',
            default => ucwords(str_replace('_', ' ', $event)),
        };
    }
}
