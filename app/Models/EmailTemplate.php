<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'key',
        'name',
        'category',
        'subject',
        'content',
        'variables',
        'description',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get template by key
     */
    public static function getByKey(string $key): ?self
    {
        return static::where('key', $key)->where('is_active', true)->first();
    }

    /**
     * Render template with variables
     */
    public function render(array $data = []): string
    {
        $content = $this->content;

        // Replace variables in content
        foreach ($data as $key => $value) {
            if (is_scalar($value)) {
                $content = str_replace("{{" . $key . "}}", $value, $content);
            }
        }

        return $content;
    }

    /**
     * Render subject with variables
     */
    public function renderSubject(array $data = []): string
    {
        $subject = $this->subject;

        foreach ($data as $key => $value) {
            if (is_scalar($value)) {
                $subject = str_replace("{{" . $key . "}}", $value, $subject);
            }
        }

        return $subject;
    }

    /**
     * Get templates by category
     */
    public static function getByCategory(string $category)
    {
        return static::where('category', $category)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }
}
