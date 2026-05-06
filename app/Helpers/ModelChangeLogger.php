<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Model;

class ModelChangeLogger
{
    public static function getChanges(
        Model $model,
        array $newData,
        array $options = []
    ): array {
        // Options
        $ignoreFields = $options['ignore'] ?? ['updated_at'];
        $specialFields = $options['special'] ?? [];

        $temp = clone $model;
        $temp->fill($newData);
        $dirty = $temp->getDirty();
        $original = $model->getOriginal();

        $changes = [];

        foreach ($dirty as $field => $newValue) {
            if (in_array($field, $ignoreFields)) continue;

            $oldValue = $original[$field] ?? null;

            // Normalize comparison (avoid "10" vs 10 issue)
            if ((string)$oldValue === (string)$newValue) continue;

            // Handle special fields (e.g. image)
            if (isset($specialFields[$field])) {
                $changes[] = [
                    'field' => $field,
                    'old'   => $oldValue,
                    'new'   => $specialFields[$field],
                ];
                continue;
            }

            $changes[] = [
                'field' => $field,
                'old'   => $oldValue,
                'new'   => $newValue,
            ];
        }

        return $changes;
    }
}
